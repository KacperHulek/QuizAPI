import { Injectable } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { TextAnswer } from './entities/text-answer.entity';
import { Repository } from 'typeorm';
import { PredefinedAnswer } from './entities/predefined-answer.entity';
import { SortAnswer } from './entities/sort-answer.entity';
import { UserAnswerDto } from './dto/user-answer.input';
import * as _ from 'lodash';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(TextAnswer)
    private textAnswersRepository: Repository<TextAnswer>,
    @InjectRepository(PredefinedAnswer)
    private predefinedAnswersRepository: Repository<PredefinedAnswer>,
    @InjectRepository(SortAnswer)
    private sortAnswersRepository: Repository<SortAnswer>,
  ) {}

  async create(createQuizInput: CreateQuizInput): Promise<Quiz> {
    const { name, questions: questionInputs } = createQuizInput;

    const savedQuiz = await this.saveQuiz(name);

    const createdQuestions = await Promise.all(
      questionInputs.map(async (questionInput) => {
        const savedQuestion = await this.saveQuestion(questionInput, savedQuiz);
        await this.saveQuestionAnswers(questionInput, savedQuestion);
        return savedQuestion;
      }),
    );

    savedQuiz.questions = createdQuestions;
    return savedQuiz;
  }

  private async saveQuiz(name: string): Promise<Quiz> {
    const newQuiz = this.quizzesRepository.create({ name });
    return await this.quizzesRepository.save(newQuiz);
  }

  private async saveQuestion(
    questionInput: any,
    quiz: Quiz,
  ): Promise<Question> {
    const { content, type } = questionInput;
    const newQuestion = this.questionsRepository.create({
      content,
      type,
      quiz,
    });
    return await this.questionsRepository.save(newQuestion);
  }

  private async saveQuestionAnswers(
    questionInput: any,
    savedQuestion: Question,
  ): Promise<void> {
    const { type, answers: answerInputs } = questionInput;

    if (type === 'Single' || type === 'Multiple') {
      await this.savePredefinedAnswers(answerInputs, savedQuestion);
    } else if (type === 'Sort') {
      await this.saveSortAnswers(answerInputs, savedQuestion);
    } else if (type === 'Text') {
      await this.saveTextAnswers(answerInputs, savedQuestion);
    }
  }

  private async savePredefinedAnswers(
    answerInputs: any[],
    savedQuestion: Question,
  ): Promise<void> {
    const createdAnswers = await Promise.all(
      answerInputs.map(async (answerInput) => {
        const { content: answerContent, isCorrect } = answerInput;
        return await this.predefinedAnswersRepository.save({
          content: answerContent,
          isCorrect,
          question: savedQuestion,
        });
      }),
    );

    if (savedQuestion.type === 'Single') {
      if (answerInputs.length < 2) {
        throw new Error('Invalid number of answers');
      }
      const numCorrectAnswers = answerInputs.filter(
        (answer) => answer.isCorrect,
      ).length;
      if (numCorrectAnswers !== 1) {
        throw new Error('Invalid number of correct answers');
      }
    }

    savedQuestion.predefinedAnswers = createdAnswers;
  }

  private async saveSortAnswers(
    answerInputs: any[],
    savedQuestion: Question,
  ): Promise<void> {
    const createdAnswers = await Promise.all(
      answerInputs.map(async (answerInput) => {
        const { content: answerContent, sortOrder: order } = answerInput;
        return await this.sortAnswersRepository.save({
          content: answerContent,
          order,
          question: savedQuestion,
        });
      }),
    );
    savedQuestion.sortAnswers = createdAnswers;
  }

  private async saveTextAnswers(
    answerInputs: any[],
    savedQuestion: Question,
  ): Promise<void> {
    const createdAnswers = await Promise.all(
      answerInputs.map(async (answerInput) => {
        const { content: answerContent } = answerInput;
        return await this.textAnswersRepository.save({
          content: answerContent,
          question: savedQuestion,
        });
      }),
    );

    savedQuestion.textAnswers = createdAnswers;

    if (savedQuestion.type === 'Text') {
      for (const answer of createdAnswers) {
        const correctAnswers = savedQuestion.textAnswers.map((ans) =>
          _.trim(ans.content.toLowerCase().replace(/[^\w\s]/g, '')),
        );
      }
    }
  }

  findAll() {
    return this.quizzesRepository.find({
      relations: [
        'questions',
        'questions.textAnswers',
        'questions.predefinedAnswers',
        'questions.sortAnswers',
      ],
    });
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOneOrFail({
      relations: [
        'questions',
        'questions.textAnswers',
        'questions.predefinedAnswers',
        'questions.sortAnswers',
      ],
      where: { id },
    });

    return quiz;
  }

  async checkAnswers(
    quizId: number,
    answers: UserAnswerDto[],
  ): Promise<{ obtainedPoints: number; maxPoints: number }> {
    const quiz = await this.quizzesRepository.findOneOrFail({
      relations: [
        'questions',
        'questions.predefinedAnswers',
        'questions.textAnswers',
        'questions.sortAnswers',
      ],
      where: { id: quizId },
    });

    let maxPoints = 0;
    let obtainedPoints = 0;

    for (const question of quiz.questions) {
      const userAnswer = answers.find((ans) => ans.questionId === question.id);

      if (!userAnswer) {
        continue;
      }

      maxPoints += 1; // Each question has 1 point

      if (question.type === 'Single' || question.type === 'Multiple') {
        const correctAnswers = question.predefinedAnswers.filter(
          (ans) => ans.isCorrect,
        );
        const userSelectedAnswers = userAnswer.selectedAnswers || [];

        const correct = correctAnswers.every((ans) =>
          userSelectedAnswers.includes(ans.id),
        );
        if (correct) {
          obtainedPoints += 1;
        }
      } else if (question.type === 'Text') {
        const correctAnswers = question.textAnswers.map((ans) =>
          _.trim(ans.content.toLowerCase().replace(/[^\w\s]/g, '')),
        );
        const userProvidedAnswer = _.trim(
          userAnswer.content?.toLowerCase().replace(/[^\w\s]/g, ''),
        );

        if (correctAnswers.includes(userProvidedAnswer)) {
          obtainedPoints += 1;
        }
      } else if (question.type === 'Sort') {
        // Parse user-provided answer to extract sorted IDs
        const userAnswerIds = JSON.parse(userAnswer.content);
        // Extract correct order from sortAnswers
        const correctOrder = question.sortAnswers.map((ans) => ans.id);
        // Check if userAnswerIds matches the correctOrder
        const correct = _.isEqual(userAnswerIds, correctOrder);
        if (correct) {
          obtainedPoints += 1;
        }
      }
    }

    return { obtainedPoints, maxPoints };
  }

  //to do
  update(id: number, updateQuizInput: UpdateQuizInput) {
    return `This action updates a #${id} quiz`;
  }

  //to do
  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }
}

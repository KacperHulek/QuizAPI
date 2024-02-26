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

    const newQuiz = this.quizzesRepository.create({ name });
    const savedQuiz = await this.quizzesRepository.save(newQuiz);

    const createdQuestions = await Promise.all(
      questionInputs.map(async (questionInput) => {
        const { content, type, answers: answerInputs } = questionInput;
        const newQuestion = this.questionsRepository.create({
          content,
          type,
          quiz: savedQuiz,
        });
        const savedQuestion = await this.questionsRepository.save(newQuestion);

        if (newQuestion.type === 'Single' || newQuestion.type === 'Multiple') {
          let numCorrectAnswers = 0;

          const createdAnswers = await Promise.all(
            answerInputs.map(async (answerInput) => {
              const { content: answerContent, isCorrect } = answerInput;
              if (isCorrect) {
                numCorrectAnswers++;
              }
              let newAnswer;
              newAnswer = this.predefinedAnswersRepository.create({
                content: answerContent,
                isCorrect,
                question: savedQuestion,
              });
              return await this.predefinedAnswersRepository.save(newAnswer);
            }),
          );

          if (newQuestion.type === 'Single' && answerInputs.length < 2)
            throw new Error('Invalid number of answers');
          else if (newQuestion.type === 'Single' && numCorrectAnswers !== 1) {
            throw new Error('Invalid number of correct answers');
          } else {
            savedQuestion.predefinedAnswers = createdAnswers;
          }
        } else if (newQuestion.type === 'Sort') {
          const createdAnswers = await Promise.all(
            answerInputs.map(async (answerInput) => {
              const { content: answerContent, sortOrder: order } = answerInput;
              let newAnswer;
              newAnswer = this.sortAnswersRepository.create({
                content: answerContent,
                order,
                question: savedQuestion,
              });
              return await this.sortAnswersRepository.save(newAnswer);
            }),
          );
          savedQuestion.sortAnswers = createdAnswers;
        } else if (newQuestion.type === 'Text') {
          const createdAnswers = await Promise.all(
            answerInputs.map(async (answerInput) => {
              const { content: answerContent } = answerInput;
              let newAnswer;
              newAnswer = this.textAnswersRepository.create({
                content: answerContent,
                question: savedQuestion,
              });
              return await this.textAnswersRepository.save(newAnswer);
            }),
          );
          savedQuestion.textAnswers = createdAnswers;
        }
        return savedQuestion;
      }),
    );
    savedQuiz.questions = createdQuestions;
    return savedQuiz;
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
        continue; // Move to the next question if no answer provided by user
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
          ans.content.toLowerCase().trim(),
        );
        const userProvidedAnswer = userAnswer.content?.toLowerCase() || '';

        if (correctAnswers.includes(userProvidedAnswer)) {
          obtainedPoints += 1;
        }
      } else if (question.type === 'Sort') {
        const correctOrder = question.sortAnswers.map((ans) => ans.order);
        const userAnswerOrder = userAnswer.order;

        const correct = correctOrder.every(
          (ans, index) => ans === userAnswerOrder[index],
        );
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

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

        if (newQuestion.type === 'Predefined') {
          const createdAnswers = await Promise.all(
            //tu można dodać logikę sprawdzającą czy 'Predefined' ma być single/multiple
            //na podstawie newQuestion.type
            //data validation might be necessary
            answerInputs.map(async (answerInput) => {
              const { content: answerContent, isCorrect } = answerInput;
              let newAnswer;
              newAnswer = this.predefinedAnswersRepository.create({
                content: answerContent,
                isCorrect,
                question: savedQuestion,
              });
              return await this.predefinedAnswersRepository.save(newAnswer);
            }),
          );
          savedQuestion.predefinedAnswers = createdAnswers;
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
    quiz.questions = quiz.questions.filter((question) => {
      if (question.type === 'Predefined') {
        return question.predefinedAnswers.length > 0;
      } else if (question.type === 'Sort') {
        return question.sortAnswers.length > 0;
      } else if (question.type === 'Text') {
        return question.textAnswers.length > 0;
      }
      return false; // Unknown question type
    });
    return quiz;
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

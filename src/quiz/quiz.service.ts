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

  //to do
  update(id: number, updateQuizInput: UpdateQuizInput) {
    return `This action updates a #${id} quiz`;
  }

  //to do
  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }
}

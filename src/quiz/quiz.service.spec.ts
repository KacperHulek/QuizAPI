import { Test, TestingModule } from '@nestjs/testing';
import { QuizResolver } from './quiz.resolver';
import { QuizService } from './quiz.service';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UserAnswerDto } from './dto/user-answer.input';
import { Quiz } from './entities/quiz.entity';
import { CreateAnswerInput } from './dto/create-answer.input';
import { CreateQuestionInput } from './dto/create-question.input';
import { PredefinedAnswer } from './entities/predefined-answer.entity';
import { Question } from './entities/question.entity';
import { Repository, Sort } from 'typeorm';
import { TextAnswer } from './entities/text-answer.entity';
import { SortAnswer } from './entities/sort-answer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    find: jest.fn((entity) => entity),
  }),
);

describe('QuizService', () => {
  let service: QuizService;
  let repositoryMockQuiz: MockType<Repository<Quiz>>;
  let repositoryMockQuestion: MockType<Repository<Question>>;
  let repositoryMockPredefinedAnswer: MockType<Repository<PredefinedAnswer>>;
  let repositoryMockTextAnswer: MockType<Repository<TextAnswer>>;
  let repositoryMockSortAnswer: MockType<Repository<SortAnswer>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(Quiz),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Question),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(PredefinedAnswer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(TextAnswer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SortAnswer),
          useFactory: repositoryMockFactory,
        },
      ],
      imports: [],
    }).compile();

    service = module.get<QuizService>(QuizService);
    repositoryMockQuiz = module.get(getRepositoryToken(Quiz));
    repositoryMockQuestion = module.get(getRepositoryToken(Question));
    repositoryMockPredefinedAnswer = module.get(
      getRepositoryToken(PredefinedAnswer),
    );
    repositoryMockTextAnswer = module.get(getRepositoryToken(TextAnswer));
    repositoryMockSortAnswer = module.get(getRepositoryToken(SortAnswer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a quiz', async () => {
    const createQuizInput: CreateQuizInput = {
      name: 'Quiz',
      questions: [],
    };
    const createdQuiz: Quiz = {
      id: 1,
      name: 'Quiz',
      questions: [],
    };

    jest
      .spyOn(service['quizzesRepository'], 'create')
      .mockReturnValue(createdQuiz);
    jest
      .spyOn(service['quizzesRepository'], 'save')
      .mockResolvedValue(createdQuiz);

    expect(await service.create(createQuizInput)).toBe(createdQuiz);
    expect(service['quizzesRepository'].create).toHaveBeenCalledWith({
      name: 'Quiz',
    });
    expect(service['quizzesRepository'].save).toHaveBeenCalledWith(createdQuiz);
  });

  it('should find all quizzes', async () => {
    const quizzes: Quiz[] = [{ id: 1, name: 'Quiz 1', questions: [] }];

    jest
      .spyOn(service['quizzesRepository'], 'find')
      .mockResolvedValueOnce(quizzes);

    expect(await service.findAll()).toBe(quizzes);
    expect(service['quizzesRepository'].find).toHaveBeenCalled();
  });

  const mockQuiz: Quiz = {
    id: 1,
    name: 'Mock Quiz',
    questions: [],
  };
});

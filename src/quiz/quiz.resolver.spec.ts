import { Test, TestingModule } from '@nestjs/testing';
import { QuizResolver } from './quiz.resolver';
import { QuizService } from './quiz.service';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { UserAnswerDto } from './dto/user-answer.input';
import { Quiz } from './entities/quiz.entity';

describe('QuizResolver', () => {
  let resolver: QuizResolver;
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizResolver,
        {
          provide: QuizService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            checkAnswers: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<QuizResolver>(QuizResolver);
    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createQuiz', () => {
    it('should call quizService.create with the provided input', async () => {
      const createQuizInput: CreateQuizInput = {
        name: 'Test Quiz',
        questions: [],
      };
      const createdQuiz: Quiz = { id: 1, name: 'Test Quiz', questions: [] };

      jest.spyOn(service, 'create').mockResolvedValueOnce(createdQuiz);

      await resolver.createQuiz(createQuizInput);

      expect(service.create).toHaveBeenCalledWith(createQuizInput);
    });
  });
  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should call quizService.checkAnswers with the provided quizId and answers', async () => {
    const quizId = 1;
    const answers: UserAnswerDto[] = [
      { questionId: 2, content: 'Answer', selectedAnswers: [1] },
    ];
    const expectedResult = { obtainedPoints: 1, maxPoints: 1 };

    jest.spyOn(service, 'checkAnswers').mockResolvedValueOnce(expectedResult);

    const result = await resolver.checkAnswers(quizId, answers);

    expect(result).toEqual(expectedResult);
    expect(service.checkAnswers).toHaveBeenCalledWith(quizId, answers);
  });

  it('should handle a scenario where no user answers are provided', async () => {
    const quizId = 1;
    const answers: UserAnswerDto[] = [];
    const expectedResult = { obtainedPoints: 0, maxPoints: 0 };

    jest.spyOn(service, 'checkAnswers').mockResolvedValueOnce(expectedResult);

    const result = await resolver.checkAnswers(quizId, answers);

    expect(result).toEqual(expectedResult);
    expect(service.checkAnswers).toHaveBeenCalledWith(quizId, answers);
  });
});

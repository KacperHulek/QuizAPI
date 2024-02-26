import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { UserAnswerDto } from './dto/user-answer.input';

@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation(() => Quiz)
  async createQuiz(@Args('createQuizInput') createQuizInput: CreateQuizInput) {
    return this.quizService.create(createQuizInput);
  }

  @Query(() => [Quiz], { name: 'getAllQuizzes' })
  findAll() {
    return this.quizService.findAll();
  }

  @Query(() => Quiz, { name: 'getQuiz' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.quizService.findOne(id);
  }

  @Mutation(() => Quiz)
  updateQuiz(@Args('updateQuizInput') updateQuizInput: UpdateQuizInput) {
    return this.quizService.update(updateQuizInput.id, updateQuizInput);
  }

  @Mutation(() => Quiz)
  removeQuiz(@Args('id', { type: () => Int }) id: number) {
    return this.quizService.remove(id);
  }

  @Query(() => [Int])
  async checkAnswers(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Args('answers', { type: () => [UserAnswerDto] }) answers: UserAnswerDto[],
  ) {
    const result = await this.quizService.checkAnswers(quizId, answers);
    return [result.obtainedPoints, result.maxPoints];
  }
}

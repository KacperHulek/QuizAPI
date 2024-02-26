import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class QuizResult {
  @Field(() => Int)
  obtainedPoints: number;

  @Field(() => Int)
  maxPoints: number;
}

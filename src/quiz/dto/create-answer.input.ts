import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateAnswerInput {
  @Field()
  content: string;

  @Field(() => Boolean, { nullable: true })
  isCorrect?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

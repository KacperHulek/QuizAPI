import { Field, InputType } from '@nestjs/graphql';
import { CreateAnswerInput } from './create-answer.input';

@InputType()
export class CreateQuestionInput {
  @Field()
  content: string;

  @Field()
  type: string;

  @Field((type) => [CreateAnswerInput])
  answers: CreateAnswerInput[];
}

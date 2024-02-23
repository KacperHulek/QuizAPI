import { InputType, Field } from '@nestjs/graphql';
import { CreateQuestionInput } from './create-question.input';

@InputType()
export class CreateQuizInput {
  @Field()
  name: string;

  @Field((type) => [CreateQuestionInput])
  questions: CreateQuestionInput[];
}

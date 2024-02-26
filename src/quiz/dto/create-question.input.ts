import { Field, InputType } from '@nestjs/graphql';
import { CreateAnswerInput } from './create-answer.input';
import { ArrayMinSize, IsIn, IsNotEmpty, IsString } from 'class-validator';

const allowedQuestionTypes = ['Single', 'Multiple', 'Sort', 'Text'];

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsString()
  @IsIn(allowedQuestionTypes)
  type: string;

  @Field((type) => [CreateAnswerInput])
  @ArrayMinSize(1, { message: 'At least one answer must be provided' })
  answers: CreateAnswerInput[];
}

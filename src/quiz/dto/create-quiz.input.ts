import { InputType, Field } from '@nestjs/graphql';
import { CreateQuestionInput } from './create-question.input';
import { ArrayMinSize, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateQuizInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => [CreateQuestionInput])
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionInput)
  questions: CreateQuestionInput[];
}

import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateAnswerInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isCorrect?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  sortOrder?: number;
}

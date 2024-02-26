import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UserAnswerDto {
  @Field((type) => Int)
  @IsNotEmpty()
  questionId: number;

  @Field((type) => [Int], { nullable: true })
  selectedAnswers?: number[];

  @IsString()
  @Field({ nullable: true })
  content?: string;

  @Field((type) => [Int], { nullable: true })
  order?: number[];
}

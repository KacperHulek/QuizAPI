import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from './quiz.entity';
import { TextAnswer } from './text-answer.entity';
import { PredefinedAnswer } from './predefined-answer.entity';
import { SortAnswer } from './sort-answer.entity';

@Entity()
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column()
  @Field()
  content: string;

  @Column()
  @Field()
  type: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @Field((type) => Quiz)
  quiz: Quiz;

  @Field((type) => [TextAnswer])
  textAnswers: TextAnswer[];

  @Field((type) => [PredefinedAnswer])
  predefinedAnswers: PredefinedAnswer[];

  @Field((type) => [SortAnswer])
  sortAnswers: SortAnswer[];
}

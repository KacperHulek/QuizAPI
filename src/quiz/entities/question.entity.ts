import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @OneToMany(() => TextAnswer, (textAnswer) => textAnswer.question)
  @Field((type) => [TextAnswer], { nullable: true })
  textAnswers?: TextAnswer[];

  @OneToMany(
    () => PredefinedAnswer,
    (predefinedAnswer) => predefinedAnswer.question,
  )
  @Field((type) => [PredefinedAnswer], { nullable: true })
  predefinedAnswers?: PredefinedAnswer[];

  @OneToMany(() => SortAnswer, (sortAnswer) => sortAnswer.question)
  @Field((type) => [SortAnswer], { nullable: true })
  sortAnswers?: SortAnswer[];
}

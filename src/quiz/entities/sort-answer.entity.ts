import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity()
@ObjectType()
export class SortAnswer {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column()
  @Field()
  content: string;

  @ManyToOne(() => Question, (question) => question.sortAnswers)
  @Field((type) => Question)
  question: Question;

  @Column()
  @Field((type) => Int, { nullable: true })
  order?: number;
}

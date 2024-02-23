import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity()
@ObjectType()
export class TextAnswer {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column()
  @Field()
  content: string;

  @ManyToOne(() => Question, (question) => question.textAnswer)
  @Field((type) => Question)
  question: Question;
}

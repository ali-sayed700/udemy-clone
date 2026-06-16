import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SectionService } from './section.service';
import { Section } from './entities/section.entity';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Resolver(() => Section)
export class SectionResolver {
  constructor(private readonly sectionService: SectionService) {}

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, { description: 'Create a new section in a course' })
  async createSection(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('input') input: CreateSectionInput,
  ): Promise<Section> {
    return this.sectionService.create(input, courseId);
  }

  @Query(() => [Section], {
    name: 'sectionsByCourse',
    description: 'Get all sections for a course',
  })
  async findByCourse(
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<Section[]> {
    return this.sectionService.findByCourse(courseId);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, { description: 'Update a section' })
  async updateSection(
    @Args('input') input: UpdateSectionInput,
  ): Promise<Section> {
    return this.sectionService.update(input);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, { description: 'Remove a section from a course' })
  async removeSection(
    @Args('id', { type: () => ID }) id: string,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<Section> {
    return this.sectionService.remove(id, courseId);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, {
    description: 'Add a lecture to a section',
  })
  async addLectureToSection(
    @Args('sectionId', { type: () => ID }) sectionId: string,
    @Args('lectureId', { type: () => ID }) lectureId: string,
  ): Promise<Section> {
    return this.sectionService.addLecture(sectionId, lectureId);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, {
    description: 'Remove a lecture from a section',
  })
  async removeLectureFromSection(
    @Args('sectionId', { type: () => ID }) sectionId: string,
    @Args('lectureId', { type: () => ID }) lectureId: string,
  ): Promise<Section> {
    return this.sectionService.removeLecture(sectionId, lectureId);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => [Section], {
    description: 'Reorder sections in a course',
  })
  async reorderSections(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('sectionIds', { type: () => [ID] }) sectionIds: string[],
  ): Promise<Section[]> {
    return this.sectionService.reorderSections(courseId, sectionIds);
  }

  @Roles(UserRole.Instructor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Section, {
    description: 'Reorder lectures within a section',
  })
  async reorderLectures(
    @Args('sectionId', { type: () => ID }) sectionId: string,
    @Args('lectureIds', { type: () => [ID] }) lectureIds: string[],
  ): Promise<Section> {
    return this.sectionService.reorderLectures(sectionId, lectureIds);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section } from './entities/section.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(CourseEntity.name) private courseModel: Model<CourseEntity>,
  ) {}

  /**
   * Create a new section and push it to the course's sections array.
   */
  async create(
    createSectionInput: CreateSectionInput,
    courseId: string,
  ): Promise<Section> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Auto-set order to the end if not provided
    if (
      createSectionInput.order === undefined ||
      createSectionInput.order === 0
    ) {
      const existingSections = course.sections?.length || 0;
      createSectionInput.order = existingSections;
    }

    const newSection = new this.sectionModel(createSectionInput);
    const savedSection = await newSection.save();

    // Push the section to the course
    await this.courseModel.findByIdAndUpdate(courseId, {
      $push: { sections: savedSection._id },
    });

    return savedSection;
  }

  /**
   * Get all sections for a course, populated with lectures.
   */
  async findByCourse(courseId: string): Promise<Section[]> {
    const course = await this.courseModel
      .findById(courseId)
      .populate({
        path: 'sections',
        populate: { path: 'lectures' },
      })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return (course.sections as unknown as Section[]) || [];
  }

  /**
   * Update a section's title or order.
   */
  async update(updateSectionInput: UpdateSectionInput): Promise<Section> {
    const { id, ...updateData } = updateSectionInput;

    const updatedSection = await this.sectionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('lectures')
      .exec();

    if (!updatedSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return updatedSection;
  }

  /**
   * Delete a section and pull it from the course.
   * Orphaned lectures remain in course.lectures as "unsectioned".
   */
  async remove(id: string, courseId: string): Promise<Section> {
    const section = await this.sectionModel.findById(id);
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    // Move section's lectures back to the course's flat lectures array (unsectioned)
    if (section.lectures && section.lectures.length > 0) {
      await this.courseModel.findByIdAndUpdate(courseId, {
        $addToSet: { lectures: { $each: section.lectures } },
      });
    }

    // Pull section from course
    await this.courseModel.findByIdAndUpdate(courseId, {
      $pull: { sections: id },
    });

    // Delete the section
    const deletedSection = await this.sectionModel.findByIdAndDelete(id).exec();
    if (!deletedSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return deletedSection;
  }

  /**
   * Add a lecture to a section.
   */
  async addLecture(sectionId: string, lectureId: string): Promise<Section> {
    const section = await this.sectionModel
      .findByIdAndUpdate(
        sectionId,
        { $addToSet: { lectures: lectureId } },
        { new: true },
      )
      .populate('lectures')
      .exec();

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    return section;
  }

  /**
   * Remove a lecture from a section.
   */
  async removeLecture(sectionId: string, lectureId: string): Promise<Section> {
    const section = await this.sectionModel
      .findByIdAndUpdate(
        sectionId,
        { $pull: { lectures: lectureId } },
        { new: true },
      )
      .populate('lectures')
      .exec();

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    return section;
  }

  /**
   * Reorder sections for a course by updating their order fields.
   */
  async reorderSections(
    courseId: string,
    sectionIds: string[],
  ): Promise<Section[]> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Update each section's order based on its index in the array
    const updatePromises = sectionIds.map((sectionId, index) =>
      this.sectionModel.findByIdAndUpdate(
        sectionId,
        { order: index },
        { new: true },
      ),
    );

    await Promise.all(updatePromises);

    // Also update the course's sections array to match the new order
    await this.courseModel.findByIdAndUpdate(courseId, {
      sections: sectionIds,
    });

    return this.findByCourse(courseId);
  }

  /**
   * Reorder lectures within a section.
   */
  async reorderLectures(
    sectionId: string,
    lectureIds: string[],
  ): Promise<Section> {
    const section = await this.sectionModel
      .findByIdAndUpdate(sectionId, { lectures: lectureIds }, { new: true })
      .populate('lectures')
      .exec();

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    return section;
  }
}

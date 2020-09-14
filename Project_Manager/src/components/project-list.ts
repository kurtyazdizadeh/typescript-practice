import { autobind } from '../decorators/autobind';
import { projectState } from '../state/project';
import { Component } from './base-component';
import { ProjectItem } from './project-item';
import { Project, ProjectStatus } from '../models/project';
import { DragTarget } from '../models/drag-drop';

//Project List class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }
  @autobind
  dragLeaveHandler(_event: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }
  @autobind
  dropHandler(event: DragEvent) {
    const projId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(proj => {
        if (this.type === 'active') {
          return proj.status === ProjectStatus.Active
        }
        return proj.status === ProjectStatus.Finished
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
    }
  }
}

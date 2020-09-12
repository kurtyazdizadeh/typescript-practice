//autobind decorator
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  }
  return adjDescriptor;
}

//validation interface
interface Validatable {
  value: string | number,
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  min?: number,
  max?: number
}

function validate(input: Validatable): boolean {
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minLength != null && typeof input.value === 'string') {
    isValid = isValid && input.value.length >= input.minLength;
  }
  if (input.maxLength != null && typeof input.value === 'string') {
    isValid = isValid && input.value.length <= input.maxLength;
  }
  if (input.min != null && typeof input.value === 'number') {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max != null && typeof input.value === 'number') {
    isValid = isValid && input.value <= input.max;
  }
  return isValid;
}

//input field class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
    }
    this.clearInputs();
  }
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const validateTitle: Validatable = {
      value: enteredTitle,
      required: true,
      minLength: 1,
      maxLength: 15
    };
    const validateDescription: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
      maxLength: 50
    };
    const validatePeople: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10
    }

    if (
      validate(validateTitle) &&
      validate(validateDescription) &&
      validate(validatePeople)
    ) {
      return [enteredTitle, enteredDescription, +enteredPeople];
    } else {
      alert('Invalid input, please try again!');
      return;
    }

  }
  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  private attach() {
    this.hostElement.append(this.element);
  }
}

const projectInput = new ProjectInput();

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { answerSelectors } from './store/answer/answer.selectors';
import { contentSelectors } from './store/content/content.selectors';
import { questionActions } from './store/question/question.actions';
import { questionSelectors } from './store/question/question.selectors';
import { ratingActions } from './store/rating/rating.actions';
import { ratingSelectors } from './store/rating/rating.selectors';
import { AppState, AppDispatch } from './store/store';
import { Step as StepType, SurveyStep } from './store/survey/survey.actions';
import { surveySelectors } from './store/survey/survey.selectors';
import { array } from './utils';

export const useAppSelector = <Params extends unknown[], Result>(
  selector: (state: AppState, ...params: Params) => Result,
  ...params: Params
) => {
  return useSelector<AppState, Result>((state) => selector(state, ...params));
};

export const useAppDispatch = () => {
  return useDispatch<AppDispatch>();
};

export const App = () => {
  const survey = useAppSelector(surveySelectors.selectSurvey, 'id');
  const [stepIndex, setStepIndex] = useState(0);
  const step = survey.steps[stepIndex];

  return (
    <div className="flex h-screen flex-row items-center justify-center bg-slate-800">
      <div className="card flex flex-col gap-4 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-4 py-2 text-white shadow-xl">
        {step.type !== SurveyStep.content && (
          <>
            <h1 className="text-2xl font-semibold">Survey App</h1>
            <hr className="opacity-20" />
          </>
        )}

        <div className="flex-1">
          <Step key={step.id} step={step} />
        </div>

        <Navigation
          stepId={step.id}
          prev={() => setStepIndex(stepIndex - 1)}
          next={() => setStepIndex(stepIndex + 1)}
        />
      </div>
    </div>
  );
};

const { selectStepIndex, selectTotalSteps, selectCanGoPrevious, selectCanGoNext } = surveySelectors;

type NavigationProps = {
  stepId: string;
  prev: () => void;
  next: () => void;
};

const Navigation = ({ stepId, prev, next }: NavigationProps) => {
  const index = useAppSelector(selectStepIndex, 'id', stepId);
  const total = useAppSelector(selectTotalSteps, 'id');

  const canGoPrev = useAppSelector(selectCanGoPrevious, 'id', stepId);
  const canGoNext = useAppSelector(selectCanGoNext, 'id', stepId);

  return (
    <div className="row items-center justify-between">
      <button
        className={clsx('text-lg font-semibold transition-opacity', !canGoNext && 'opacity-0')}
        onClick={next}
      >
        Next
      </button>
      <nav className="row items-center gap-2">
        <button type="button" className="disabled:opacity-50" disabled={!canGoPrev} onClick={prev}>
          <ChevronLeftIcon className="h-4 w-4 stroke-2" />
        </button>
        {index + 1} / {total}
        <button type="button" className="disabled:opacity-50" disabled={!canGoNext} onClick={next}>
          <ChevronRightIcon className="h-4 w-4 stroke-2" />
        </button>
      </nav>
    </div>
  );
};

type StepProps = {
  step: StepType;
};

const Step = ({ step }: StepProps) => {
  const Component = {
    content: Content,
    question: Question,
    rating: Rating,
  }[step.type];

  return <Component id={step.id} />;
};

type ContentProps = {
  id: string;
};

const Content = ({ id }: ContentProps) => {
  const text = useAppSelector(contentSelectors.selectText, id);

  return (
    <div className="col h-full items-center justify-center">
      <div className="text-4xl">{text}</div>
    </div>
  );
};

type QuestionProps = {
  id: string;
};

const Question = ({ id }: QuestionProps) => {
  const text = useAppSelector(questionSelectors.selectText, id);
  const answers = useAppSelector(questionSelectors.selectAnswers, id);

  return (
    <div>
      <div className="mb-4 text-4xl">{text}</div>
      {answers.map((answer) => (
        <Answer key={answer.id} id={answer.id} />
      ))}
    </div>
  );
};

type AnswerProps = {
  id: string;
};

const Answer = ({ id }: AnswerProps) => {
  const dispatch = useAppDispatch();

  const text = useAppSelector(answerSelectors.selectText, id);
  const selected = useAppSelector(answerSelectors.selectIsSelected, id);

  return (
    <div key={id} className="text-xl">
      <input
        type="radio"
        id={id}
        name={id}
        checked={selected}
        className="mx-4 my-2"
        onChange={() => {}}
        onClick={() => dispatch(questionActions.toggleAnswer(id))}
      />
      <label htmlFor={id} className="cursor-pointer">
        {text}
      </label>
    </div>
  );
};

type RatingProps = {
  id: string;
};

const Rating = ({ id }: RatingProps) => {
  const dispatch = useAppDispatch();

  const text = useAppSelector(ratingSelectors.selectText, id);
  const max = useAppSelector(ratingSelectors.selectMax, id);
  const value = useAppSelector(ratingSelectors.selectValue, id);

  const [mouseOver, setMouseOver] = useState<number>();

  const fill = (idx: number) => {
    if (mouseOver !== undefined) {
      if (idx < mouseOver + 1) {
        return 'text-yellow-500/75';
      } else {
        return 'text-transparent';
      }
    }

    if (value) {
      if (idx < value) {
        return 'text-yellow-500';
      }
    }

    return 'text-transparent';
  };

  return (
    <div className="col">
      <div className="mb-4 text-4xl">{text}</div>
      <div className="row mx-auto mt-10 gap-2" onMouseLeave={() => setMouseOver(undefined)}>
        {array(max, (idx) => idx).map((idx) => (
          <StarIcon
            key={idx}
            className={clsx('h-10 w-10 cursor-pointer stroke-white', fill(idx))}
            onMouseEnter={() => setMouseOver(idx)}
            onClick={() => {
              dispatch(ratingActions.setValue(id, idx + 1));
              setMouseOver(undefined);
            }}
          />
        ))}
      </div>
    </div>
  );
};

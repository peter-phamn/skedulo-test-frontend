import React, { useEffect, useMemo, useReducer } from "react";
import _ from "lodash";

import {
  ActivityAllocations,
  IAppTabContainer,
  JobAllocations,
  Job,
  Activity,
  Resource,
} from "../common/types";
import { SectionGroup } from "../components/section/SectionGroup";
import { SectionPanel } from "../components/section/SectionPanel";

enum AllocType {
  JOB = "job",
  ACTIVITY = "activity",
}
interface Allocation {
  allocType: AllocType;
  name: string;
  start: string;
  end: string;
}

interface ResourceSchedule {
  resourceName: string;
  resourceId: number;
  allocations: Allocation[];
}

type State = {
  jobAllocations: JobAllocations[];
  activityAllocations: ActivityAllocations[];
  jobs: Job[];
  activities: Activity[];
  resources: Resource[];
};

const initialState: State = {
  jobAllocations: [],
  activityAllocations: [],
  jobs: [],
  activities: [],
  resources: [],
};

type Action =
  | { type: "GetJobAllocations"; payload: JobAllocations[] }
  | { type: "GetActivityAllocations"; payload: ActivityAllocations[] }
  | { type: "GetJobs"; payload: Job[] }
  | { type: "GetActivities"; payload: Activity[] }
  | { type: "GetResources"; payload: Resource[] }
  | { type: "reset" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "GetJobAllocations": {
      return { ...state, jobAllocations: action.payload };
    }
    case "GetActivityAllocations": {
      return { ...state, activityAllocations: action.payload };
    }
    case "GetActivities": {
      return { ...state, activities: action.payload };
    }
    case "GetJobs": {
      return { ...state, jobs: action.payload };
    }
    case "GetResources": {
      return { ...state, resources: action.payload };
    }
    case "reset": {
      return initialState;
    }
    default:
      return initialState;
  }
};

export const QuestionTwo: React.FC<IAppTabContainer> = ({ service }) => {
  const [
    { activities, activityAllocations, jobAllocations, jobs, resources },
    dispatch,
  ] = useReducer(reducer, initialState);

  const jobActivitiesAllocations = useMemo(() => {
    return _(jobAllocations)
      .keyBy("resourceId")
      .merge(_.keyBy(activityAllocations, "resourceId"))
      .merge(_.keyBy(resources, "id"))
      .values()
      .value();
  }, [activityAllocations, jobAllocations, resources]);

  const resourceSchedule: ResourceSchedule[] = useMemo(
    () =>
      jobActivitiesAllocations.map((item) => {
        const result: Partial<typeof item> & { resourceName: string } = {
          resourceName: item.name,
          ...item,
        };
        const allocations: Allocation[] = [];
        _.keys(item).forEach((key) => {
          if (key === "activityId" || key === "jobId") {
            const allocType =
              key === "activityId" ? AllocType.ACTIVITY : AllocType.JOB;
            const allocRawData = allocType === "activity" ? activities : jobs;
            const allocData = _.find(allocRawData, { id: item[key] });

            allocations.push({
              allocType,
              name: allocData?.name || "",
              start: allocData?.start || "",
              end: allocData?.end || "",
            });
            delete result[key];
          }
        });
        delete result.name;
        delete result.id;
        return {
          ...result,
          allocations: _.orderBy(allocations, ["name"], ["desc"]),
        } as ResourceSchedule;
      }),
    [activities, jobActivitiesAllocations, jobs]
  );

  useEffect(() => {
    (async () => {
      try {
        const [
          jobAllocations,
          activityAllocations,
          jobs,
          activities,
          resources,
        ] = await Promise.all([
          service.getJobAllocations(),
          service.getActivityAllocations(),
          service.getJobs(),
          service.getActivities(),
          service.getResources(),
        ]);
        dispatch({ type: "GetJobAllocations", payload: jobAllocations });
        dispatch({
          type: "GetActivityAllocations",
          payload: activityAllocations,
        });
        dispatch({ type: "GetJobs", payload: jobs });
        dispatch({ type: "GetActivities", payload: activities });
        dispatch({ type: "GetResources", payload: resources });
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SectionGroup>
      <SectionPanel>
        <span>{JSON.stringify(resourceSchedule)}</span>
      </SectionPanel>
    </SectionGroup>
  );
};

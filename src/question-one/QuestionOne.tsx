import React, { useEffect, useState } from "react";
import { object, string } from "zod";
import { isEmpty, keys } from "lodash";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDebounce } from "../hooks";
import { Contact, IAppTabContainer, Job } from "../common/types";
import { SectionGroup } from "../components/section/SectionGroup";
import { SectionPanel } from "../components/section/SectionPanel";

import "./QuestionOne.css";

export const QuestionOne: React.FC<IAppTabContainer> = ({ service }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [jobs, setJobs] = useState<
    Array<Pick<Job, "name" | "start" | "end"> & { contact: Contact }>
  >([]);

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(
      object({
        search: string().min(3, { message: "At least 3 characters" }),
      })
    ),
    defaultValues: {
      search: "",
    },
  });

  const searchTerm = watch("search");

  const debouncedValue = useDebounce<string>(searchTerm, 500, isValid);

  useEffect(() => {
    (async () => {
      if (isEmpty(debouncedValue)) {
        setJobs([]);
      } else {
        setLoading(true);
        try {
          const data = (await service.getJobsWithSearchTerm(
            debouncedValue
          )) as unknown as Array<
            Pick<Job, "name" | "start" | "end"> & { contact: Contact }
          >;
          setJobs(data);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      }
    })();
  }, [debouncedValue, service]);

  const renderJobCard = (
    job: Pick<Job, "name" | "start" | "end"> & { contact: Contact },
    index: number
  ) => {
    return (
      <div key={index} className="card">
        <span className="card__title">{`Job ${index}`}</span>
        {keys(job).map((key) => {
          if (key !== "__typename") {
            const data =
              key === "contact"
                ? (job[key as keyof typeof job] as Contact).name
                : job[key as keyof typeof job];
            return (
              <div className="card-details">
                <span className="card-details__label">{key}: </span>
                <span>
                  {key === "start" || key === "end"
                    ? new Date(data.toString()).toLocaleString()
                    : data}
                </span>
              </div>
            );
          }
          return <></>;
        })}
      </div>
    );
  };

  return (
    <SectionGroup>
      <SectionPanel>
        <div className="form">
          <span className="form__label">Search</span>
          <input
            placeholder="Typing..."
            className="form__input"
            {...register("search")}
          />
          {errors["search"] && (
            <span className="form__label form__label--error">
              {errors["search"].message}
            </span>
          )}
        </div>
        <div className="main">
          {loading && (
            <div className="sk-chase">
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
            </div>
          )}
          {jobs.length > 0 ? (
            <>
              <span className="form__label form__label--success">{`There are a total of ${jobs.length} jobs`}</span>
              {jobs.map((job, index) => renderJobCard(job, index + 1))}
            </>
          ) : (
            <span className="form__label form__label--success">
              No jobs found
            </span>
          )}
        </div>
      </SectionPanel>
    </SectionGroup>
  );
};

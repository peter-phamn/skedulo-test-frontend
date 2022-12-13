import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import { IAppTabContainer, Job, JobAllocations } from "../common/types";
import { SectionGroup } from "../components/section/SectionGroup";
import { SectionPanel } from "../components/section/SectionPanel";

import "./QuestionThree.css";

export const QuestionThree: React.FC<IAppTabContainer> = ({ service }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobAllocations, setJobAllocations] = useState<JobAllocations[]>([]);

  const data = useMemo(() => {
    return jobs.map((job) => {
      const totalAllocations = jobAllocations.filter(
        (a) => a.jobId === job.id
      ).length;
      return {
        ...job,
        totalAllocations,
      };
    });
  }, [jobAllocations, jobs]);

  const renderJobCard = (
    job: Job & { totalAllocations: number },
    index: number
  ) => {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">
            <span className="card-header-title__name">{job.name}</span>
            <span className="card-header-title__no">{`(Job #${index})`}</span>
          </div>
          <span className="card-info">{job.location}</span>
        </div>
        <div className="card-details">
          <div className="card-details__time">
            <span className="card-info">
              {new Date(job.start).toDateString()}
            </span>
            <span className="card-info">{`${dayjs(job.start).format(
              "HH:mm"
            )} - ${dayjs(job.end).format("HH:mm")}`}</span>
          </div>
          {job.totalAllocations > 0 && (
            <div className="card-details__circle">
              <span className="card-details__text">{job.totalAllocations}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      const [jobAllocations, jobs] = await Promise.all([
        service.getJobAllocations(),
        service.getJobs(),
      ]);
      setJobs(jobs);
      setJobAllocations(jobAllocations);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SectionGroup>
      <SectionPanel>
        <div className="container">
          <div className="side-bar"></div>
          <div className="content">
            <div className="header">
              <span className="header__title">Header </span>
            </div>
            <div className="content__details">
              <div className="jobs-view">
                {[...data, ...data].map((item, index) =>
                  renderJobCard(item, index)
                )}
              </div>
              <div className="list-view">
                <div className="list-view__item" />
                <div className="list-view__item" />
                <div className="list-view__item" />
                <div className="list-view__item" />
                <div className="list-view__item" />
                <div className="list-view__item" />
              </div>
            </div>
          </div>
        </div>
      </SectionPanel>
    </SectionGroup>
  );
};

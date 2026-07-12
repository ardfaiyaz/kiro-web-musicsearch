"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Target, CheckCircle, Trophy, Flame } from "lucide-react";
import { getWeeklyChallenges, getChallengeProgress, type Challenge } from "@/lib/challenges";

function subscribeNoop() {
  return () => {};
}

function getClientChallenges(): Challenge[] {
  return getWeeklyChallenges();
}

const emptyChallenges: Challenge[] = [];

function getServerChallenges(): Challenge[] {
  return emptyChallenges;
}

export default function ListeningChallenges() {
  const challenges = useSyncExternalStore(subscribeNoop, getClientChallenges, getServerChallenges);
  const progress = useMemo(() => getChallengeProgress(challenges), [challenges]);
  const mounted = challenges !== emptyChallenges;

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6" aria-busy="true">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded shimmer-wave" />
          <div className="h-5 w-32 rounded shimmer-wave" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl shimmer-wave" />
          ))}
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return null;
  }

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6" aria-label="Weekly listening challenges">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-foreground" aria-hidden="true" />
          <h3 className="text-lg font-bold text-foreground">Weekly Challenges</h3>
        </div>
        {completedCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <Flame className="h-3 w-3" aria-hidden="true" />
            {completedCount}/{challenges.length} done
          </span>
        )}
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => {
          const prog = progress.find((p) => p.challengeId === challenge.id);
          const current = prog?.current || 0;
          const completed = prog?.completed || false;
          const percentage = Math.min((current / challenge.target) * 100, 100);

          return (
            <div
              key={challenge.id}
              className={`rounded-xl border p-4 transition-colors ${
                completed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {completed ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                    ) : (
                      <Trophy className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    )}
                    <h4 className={`text-sm font-semibold ${completed ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                      {challenge.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-muted pl-6">
                    {challenge.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted">
                  {current}/{challenge.target}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 ml-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completed ? "bg-green-500" : "bg-foreground"
                    }`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={current}
                    aria-valuemin={0}
                    aria-valuemax={challenge.target}
                    aria-label={`${challenge.title}: ${current} of ${challenge.target}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const OnboardingTasksNav = () => {
  const [completedTasks, setCompletedTasks] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from('brand_identity')
          .select('tasks_completed')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setCompletedTasks(data.tasks_completed || []);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading || completedTasks.length === 2) return null;

  const tasks = [
    {
      id: 'brand_identity',
      title: 'Review Brand Identity',
      url: '/brand',
      completed: completedTasks.includes('brand_identity')
    },
    {
      id: 'brand_calendar',
      title: 'Review Brand Calendar',
      url: '/calendar',
      completed: completedTasks.includes('brand_calendar')
    }
  ].filter(task => !task.completed);

  if (tasks.length === 0) return null;

  return (
    <>
      <div className="px-3 pt-5 pb-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          First Use Setup Tasks
        </h2>
        <div className="space-y-1">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={task.url}
              className="flex items-center justify-between w-full p-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <span>{task.title}</span>
              {task.completed && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </Link>
          ))}
        </div>
      </div>
      <div className="h-px bg-polaris-border mx-4" />
    </>
  );
};

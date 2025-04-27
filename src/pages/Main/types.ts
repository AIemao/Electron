export type Action = {
  label: string;
  onClick: () => void;
};

export type MainProps = {
  title: string;
  description: string;
  actions: Action[];
};


export type DashboardItem = {
  id: string;
  label: string;
  path: string;
};
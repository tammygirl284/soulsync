// src/lib/projects.ts
export interface Project {
  id:       number;
  emoji:    string;
  name:     string;
  category: string;
  desc:     string;
  tasks:    string;
  status:   "Active" | "On Hold" | "Completed";
}

export const PROJECTS: Project[] = [
  { id:1,  emoji:"🤖", name:"Anne OS Build",       category:"AI",      desc:"Chief of Staff agent on Pinocchio — Airtable brain, Telegram, auto-logging sessions.", tasks:"3 of 8 tasks", status:"Active"  },
  { id:2,  emoji:"🍜", name:"Thai Moon Ops",        category:"Income",  desc:"Live revenue dashboard, payroll, Toast exports, manager hub.",                         tasks:"2 of 5 tasks", status:"Active"  },
  { id:3,  emoji:"🏢", name:"National Grid",        category:"Income",  desc:"BCB learning series, contract commercials work with Bryan.",                           tasks:"1 of 3 tasks", status:"Active"  },
  { id:4,  emoji:"🧠", name:"Book Project",         category:"Vision",  desc:"Humanity co-existing with AI — Know, Learn, Work, Connect framework.",                tasks:"0 of 4 tasks", status:"Active"  },
  { id:5,  emoji:"🏡", name:"Ocean Edge STR",       category:"Income",  desc:"Short-term rental managed by 5-Star Co-Host (Jen & Jhegs).",                          tasks:"0 of 2 tasks", status:"Active"  },
  { id:6,  emoji:"🏒", name:"Dante Athletics",      category:"Family",  desc:"AAA hockey goaltender + baseball. Arm injury care pathway.",                          tasks:"1 of 3 tasks", status:"Active"  },
  { id:7,  emoji:"🎮", name:"Luke Projects",        category:"Family",  desc:"Roblox project, creative interests, online school research.",                          tasks:"0 of 2 tasks", status:"Active"  },
  { id:8,  emoji:"💪", name:"Health & Fitness",     category:"Health",  desc:"Yoga, Body Combat, Body Pump, kickboxing, meditation, macro tracking.",                tasks:"0 of 2 tasks", status:"Active"  },
  { id:9,  emoji:"🌐", name:"Tammy's Hub",          category:"Vision",  desc:"tammy-hub.vercel.app — centralized Next.js dashboard for all life domains.",          tasks:"1 of 1 tasks", status:"Active"  },
  { id:10, emoji:"📚", name:"Mindvalley Learning",  category:"Vision",  desc:"AI leadership, personal development. Mentor: Vishen Lakhiani.",                       tasks:"0 of 3 tasks", status:"Active"  },
  { id:11, emoji:"💰", name:"Wealth Command",       category:"Finance", desc:"Net worth, investments, real estate, income, documents.",                             tasks:"0 of 2 tasks", status:"Active"  },
  { id:12, emoji:"🔧", name:"Pinocchio Infra",      category:"AI",      desc:"Mac Mini M4 — n8n, OpenClaw, Claude Code, Google OAuth, automations.",               tasks:"2 of 4 tasks", status:"Active"  },
  { id:13, emoji:"🌊", name:"BCB Series",           category:"Income",  desc:"Beyond Contract Basics at National Grid. Session 1 complete. Session 2 planning.",    tasks:"1 of 3 tasks", status:"On Hold" },
  { id:14, emoji:"🎓", name:"Online School Search", category:"Family",  desc:"Excel High School for Dante. ASU Prep Digital + FIRST Robotics for Luke.",            tasks:"0 of 2 tasks", status:"On Hold" },
];

export const AVATAR_BG: Record<string, string> = {
  AI:      "#dbeafe",
  Income:  "#dcfce7",
  Vision:  "#ede9fe",
  Family:  "#fce7f3",
  Health:  "#fef9c3",
  Finance: "#d1fae5",
};

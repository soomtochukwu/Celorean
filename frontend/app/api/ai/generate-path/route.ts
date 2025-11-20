import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { goal } = await request.json();

    // Mock AI delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response generation based on goal
    const learningPath = {
      id: "lp_" + Math.random().toString(36).substr(2, 9),
      goal: goal,
      modules: [
        {
          id: 1,
          title: "Introduction to " + goal,
          description: "Learn the basics and fundamental concepts.",
          duration: "2 hours",
          type: "video",
          completed: false,
        },
        {
          id: 2,
          title: "Core Concepts of " + goal,
          description: "Deep dive into the core mechanics and theory.",
          duration: "4 hours",
          type: "reading",
          completed: false,
        },
        {
          id: 3,
          title: "Hands-on Practice",
          description: "Apply what you've learned in a practical exercise.",
          duration: "3 hours",
          type: "quiz",
          completed: false,
        },
        {
          id: 4,
          title: "Advanced Topics",
          description: "Explore advanced techniques and best practices.",
          duration: "5 hours",
          type: "project",
          completed: false,
        },
      ],
    };

    return NextResponse.json(learningPath);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate learning path" },
      { status: 500 }
    );
  }
}

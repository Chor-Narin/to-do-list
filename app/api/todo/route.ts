//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Configure with Local API /////////////////////////
//////////////////////////////////////////////////////////////////////////////

// import { NextRequest, NextResponse } from "next/server";
// import { addTodo, getTodos } from "../../lib/todos";


// // GET ALL TODOS
// export async function GET() {
//   try {
//     const todos = await getTodos();
//     return NextResponse.json(todos);
//   } catch (error) {
//     console.error('GET ERROR:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
// // CREATE NEW TODO
// export async function POST(req: NextRequest) {
//   const { id, todo, isCompleted, createdAt } = await req.json();
//   try {
//     if (!id || !todo || isCompleted === undefined || !createdAt) {
//       return NextResponse.json(
//         { message: "Invalid request body" },
//         { status: 400 }
//       );
//     }
//     addTodo({ id, todo, isCompleted: isCompleted, createdAt: createdAt });
//     return new NextResponse('success', { status: 201 });
//   } catch (error) {
//     console.error("API ERROR:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Configure with supabase //////////////////////////
//////////////////////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

// GET Todos
export async function GET() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("createdAt", { ascending: true });
  if (error) return NextResponse.json(error, { status: 500 });
  return NextResponse.json(data);
}

// Create Todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, todo, isCompleted, createdAt } = body;
    if (!id || !todo || isCompleted === undefined || !createdAt) {
      return NextResponse.json("Invalid body", { status: 400 });
    }
    const { error } = await supabase
      .from("todos")
      .insert({ id, todo, isCompleted: isCompleted, createdAt: createdAt });
    if (error) return NextResponse.json(error, { status: 500 });
    return NextResponse.json("success");
  } catch (error) {
    console.error("SUPABASE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

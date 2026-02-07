//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Configure with Local API /////////////////////////
//////////////////////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from 'next/server';
import { addTodo, getTodos } from '../../lib/todos';
import { v4 as uuidv4 } from 'uuid';

// GET ALL TODOS
export async function GET() {
  try {
    const todos = await getTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('GET ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
// CREATE NEW TODO
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    if (!body.todo || typeof body.todo !== 'string') {
      return NextResponse.json(
        { message: 'Invalid request body todo' },
        { status: 400 }
      );
    }
    addTodo({
      id: uuidv4(),
      todo: body.todo,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    return new NextResponse('success', { status: 201 });
  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Configure with supabase //////////////////////////
//////////////////////////////////////////////////////////////////////////////

// import { NextRequest, NextResponse } from "next/server";
// import { v4 as uuidv4 } from 'uuid';
// import { supabase } from "../../lib/supabase";

// // GET Todos
// export async function GET() {
//   const { data, error } = await supabase
//     .from("todos")
//     .select("*")
//     .order("createdAt", { ascending: true });
//   if (error) return NextResponse.json(error, { status: 500 });
//   return NextResponse.json(data);
// }

// // Create Todo
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const {todo} = body;
//     if (!todo ) {
//       return NextResponse.json("Invalid body", { status: 400 });
//     }
//     const { error } = await supabase
//       .from("todos")
//       .insert({ id: uuidv4(), todo, isCompleted: false, createdAt: new Date().toISOString() });
//     if (error) return NextResponse.json(error, { status: 500 });
//     return NextResponse.json("success");
//   } catch (error) {
//     console.error("SUPABASE ERROR:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Configure with local /////////////////////////////
//////////////////////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from 'next/server';
import { deleteTodo, updateTodo } from '@/app/lib/todos';

interface Todo {
  id: string;
  todo: string;
  isCompleted: boolean;
  createdAt: string;
}

// EDIT TODO
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }
    const body = await req.json();
    const { todo, isCompleted } = body;
    const updates: Partial<Todo> = {};

    if (typeof todo === 'string') {
      updates.todo = todo.trim();
    }
    if (typeof isCompleted === 'boolean') {
      updates.isCompleted = isCompleted;
    }
    await updateTodo(id, updates);
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('PUT ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE TODO
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const success = await deleteTodo(id);
    if (!success) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('DELETE ERROR:', error);
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
// import { supabase } from "../../../lib/supabase";
// import { console } from "inspector";

// // EDIT TODO
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // const resolvedParams = await params;
//     // const id = resolvedParams.id;
//     const id = (await params).id;
//     if (!id) {
//       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//     }
//     const body = await request.json();
//     const { todo, isCompleted } = body;

//     const updates: { todo?: string; isCompleted?: boolean } = {};
//     if (typeof todo === "string") updates.todo = todo;
//     if (typeof isCompleted === "boolean") updates.isCompleted = isCompleted;

//     const { data, error } = await supabase
//       .from("todos")
//       .update(updates)
//       .eq("id", id)
//       .select()
//       .single();
//     if (error) {
//       console.error("SUPABASE ERROR:", error);
//       return NextResponse.json(error, { status: 500 });
//     }
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("PUT ERROR:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // DELETE TODO
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try{
//     const resolvedParams = await params;
//     const { error } = await supabase.from("todos").delete().eq("id", resolvedParams.id);
//   if (error) return NextResponse.json(error, { status: 500 });
//   return NextResponse.json("success");
//   }catch(err){
//     console.error("PUT ERROR:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

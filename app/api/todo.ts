import { NextApiRequest, NextApiResponse } from "next";
import { addTodo, getTodos } from "../lib/todos";


export default function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'GET'){
        res.status(200).json(getTodos())
    }else if (req.method === 'POST'){
        const {id, todo, isCompleted, createdAt} = req.body;
        if(!id || !todo || isCompleted === undefined || !createdAt){
            res.status(400).json({message: "Invalid request body"})
        }
        addTodo({id, todo, isCompleted, createdAt});
        res.status(201).json({message : "Todo added successfully"});
    }else{
        res.status(405).json({message: "Method not allowed"})
    }

}
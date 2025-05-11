<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AI_EvaluateController extends Controller
{
    public function show()
    {
        return Inertia::render('AI_Evaluate');
    }
}

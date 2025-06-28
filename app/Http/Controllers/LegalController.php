<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Show the terms of service page.
     */
    public function terms(): Response
    {
        return Inertia::render('Legal/Terms');
    }

    /**
     * Show the privacy policy page.
     */
    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy');
    }
}

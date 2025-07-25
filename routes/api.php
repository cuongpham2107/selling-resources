<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\AppotaService;
use App\Http\Controllers\BankTransferController;


Route::post('/bank-transfer', [BankTransferController::class, 'send']);


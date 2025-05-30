<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PreparationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\HomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home', [HomeController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('home');
Route::put('/agendas/{id}/update-status', [HomeController::class, 'updateStatus']);
Route::get('/analyze/{imageName}', [HomeController::class, 'analyze']);
Route::post('/updatePhoto/{roomId}', [HomeController::class, 'updatePhoto'])->name('updatePhoto');
Route::get('/home/rooms/{img_name}', [HomeController::class, 'getRoomImage'])->name('home.room.img');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/preparation', [PreparationController::class, 'show'])->name('preparation');
Route::post('/upload', [PreparationController::class, 'store'])->name('upload');
Route::delete('/preparation/delete/{id}', [PreparationController::class, 'delete'])->name('preparation.delete');

Route::get('/rooms/{img_name}', [PreparationController::class, 'getRoomImage'])->name('get.room.img');

Route::get('/task', [TaskController::class, 'show'])->name('task');
Route::post('/store', [TaskController::class, 'store'])
    ->name('store');
Route::delete('/task/delete/{id}', [TaskController::class, 'delete'])->name('task.delete');

require __DIR__.'/auth.php';

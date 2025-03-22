<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained("company")->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('brand');
            $table->string('model');
            $table->string('body_type')->nullable();
            $table->string('color')->nullable();
            $table->string('location');
            $table->integer('year');
            $table->string('doors');
            $table->string('cylinders');
            $table->string('transmission');
            $table->string('fuel');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};

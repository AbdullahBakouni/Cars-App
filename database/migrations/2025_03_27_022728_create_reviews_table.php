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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who wrote the review
            $table->foreignId('car_id')->nullable()->constrained()->onDelete('cascade'); // Review for a specific car
            $table->foreignId('company_id')->nullable()->constrained("company")->onDelete('set null'); // Review for a specific company
            $table->text('comment')->nullable();
            $table->decimal('rating', 3, 2)->nullable(); // Optional review text
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

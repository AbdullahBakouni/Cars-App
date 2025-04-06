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
        Schema::create('company', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name')->nullable();
            $table->string('logo_path');
            $table->decimal('rates', 3, 2)->default(0);
            $table->string('location')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'rating']);
            $table->index('user_id');          // البحث عن الشركات الخاصة بمستخدم معين 
            $table->index('rates');          // البحث عن الشركات الخاصة بمستخدم معين 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company');
    }
};

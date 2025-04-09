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
            $table->foreignId('phone_id')->constrained("phones")->onDelete('cascade');
            $table->text('description');
            $table->string('brand');
            $table->string('model');
            $table->string('body_type');
            $table->decimal('mileage', 15, 2);
            $table->enum('currency', ['SYP', 'USD'])->default('SYP');
            $table->enum('status', ['sell', 'rent', 'rented', 'sold'])->default('sell');
            $table->decimal('rates', 3, 2)->default(0);
            $table->integer('engine')->nullable();
            $table->string('color')->nullable();
            $table->string('location');
            $table->integer('year');
            $table->string('doors');
            $table->string('cylinders');
            $table->string('transmission');
            $table->string('fuel')->nullable();
            $table->decimal('price', 15, 2);
            $table->timestamps();

        // فهرس مركب للتصفية حسب المحرك والسعر
        $table->index(['year']); // فهرس على سنة التصنيع لتسريع الفرز
        $table->index(['mileage']); // فهرس على المسافة المقطوعة لتسريع الفرز
        $table->index(['currency', 'price']); // فهرس مركب للعملة والسعر
        $table->index(['status']); // فهرس على الحالة لتسريع الفلترة
        $table->index(['price']);
        $table->index(['body_type']);
        $table->index(['brand']);
        $table->index(['currency']);
        $table->index(['body_type','doors']);
        $table->index(['body_type','currency','price']);
        $table->index(['body_type','cylinders','currency','price']);
        $table->index(['cylinders']);
        $table->index(['created_at']);
        $table->index(['rates']);
        $table->index(['brand','model']);
        $table->index(['body_type','brand','model']);
                        // فهرس على حالة السيارة لتسريع البحث عن السيارات المباعة أو المؤجرة
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

<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Feedback;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Models\Work;
use App\Models\WorkBlock;
use App\Nova\Blog;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Cashier\Cashier;
use Laravel\Telescope\Telescope;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        Cashier::ignoreRoutes();
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        TrimStrings::skipWhen(function (Request $request) {
            return $request->is('api2/post/*');
        });

        ConvertEmptyStringsToNull::skipWhen(function (Request $request) {
            return $request->is('api2/post/*');
        });
        Schema::defaultStringLength(191);

        Password::defaults(fn() => Password::min(8)->mixedCase()->numbers());

        Relation::morphMap(
            [
                'work' => Work::class,
                'comment' => Comment::class,
                'user' => User::class,
                'feedback' => Feedback::class,
                'tag' => Tag::class,
                'blog' => Blog::class,
                'post' => Post::class
            ]
        );
    }
}

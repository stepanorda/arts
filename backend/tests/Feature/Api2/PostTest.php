<?php

use App\Models\{User, Work, Image, Post};


uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('Create post', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->postJson('/api2/post')->assertCreated();
    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
    ]);
});


test('Delete post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
    ]);
    $this->actingAs($user)->deleteJson('/api2/post/' . $post->id)->assertNoContent();
    $this->assertDatabaseHas('posts', [
        'id' => $post->id,
        'deleted_at' => now(),
    ]);
});

test('Save post', function () {
    [$user, $wrongUser] = User::factory()->count(2)->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $image = Image::factory()->create();
    $work = Work::factory()->create();

    $validDelta = [
        "ops" =>
            [
                [
                    "insert" => "text1\ntext2"
                ],
                [
                    "attributes" => ["header" => 1],
                    "insert" => "\n"
                ]
            ]
    ];
    $validBody = [
        'title' => 'test title',
        'language' => 'en',
        'body' => $validDelta
    ];
    // Can't edit another user's post.
    $this->actingAs($wrongUser)->putJson("/api2/post/{$post->id}", $validBody)->assertForbidden();

    // Required fields
    $this->actingAs($user)->putJson("/api2/post/{$post->id}", [
        'body' => $validDelta
    ])->assertInvalid([
        'title', 'language'
    ]);

    $this->actingAs($user)->putJson("/api2/post/{$post->id}", $validBody)->assertOk();
    \Pest\Laravel\assertDatabaseHas('posts', [
        'title' => 'test title',
        'body' => json_encode($validDelta)
    ]);
});
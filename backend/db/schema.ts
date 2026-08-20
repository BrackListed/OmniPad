import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerk_user_id: text("clerk_user_id").notNull().unique(),
    email: text("email").default("").unique(),
    username: text("username").notNull(),
    created_at: timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
    has_seen_tour: boolean("has_seen_tour").default(false)
})


export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
    title: text("title").notNull(),
    details: text("details"),
    due: text("due"),
    type: text("type", {enum: ['Assignments', 'Tasks', 'Events']}).default("Assignments"),
    created_at: timestamp("created_at", {withTimezone: true}).defaultNow(),
    completed: boolean("completed").default(false)
})


export const file = pgTable("file", {
    id: uuid("id").defaultRandom().primaryKey(),
    filename: text('filename'),
    upload_date: timestamp("upload_date", {withTimezone: true}).defaultNow(),
    user_id: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
    path: text('path'),
    file_hash: text("file_hash").unique(),
    completed: boolean("completed").default(false)
})

export const study_sessions = pgTable("study_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    file_id: uuid("file_id").references(() => file.id, { onDelete: "cascade" }), 
    mode: text("mode", {enum: ['Feynman', 'Socratic', 'Quiz', 'Flashcards']}).notNull(), 
    topic: text("topic").notNull(),    
    score: integer("score").notNull(), 
    passed: boolean("passed").default(false), 
    feedback: text("feedback").default("Finish to get feedback!"),
    wrong_index: integer("wrong_index").array(), //reminder to myself: since payload is in the frontend, use this to grab the items the user got wrong
    payload: jsonb("payload"),
    already_attempted: boolean("already_attempted").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
    tasks: many(tasks),
    files: many(file),
    studySessions: many(study_sessions)
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
    user: one(users, {
        fields: [tasks.user_id],
        references: [users.id]
    })
}))

export const fileRelations = relations(file, ({ one, many }) => ({
    user: one(users, {
        fields: [file.user_id],
        references: [users.id]
    }),
    studySessions: many(study_sessions)
}))

export const studySessionsRelations = relations(study_sessions, ({ one }) => ({
    user: one(users, {
        fields: [study_sessions.user_id],
        references: [users.id]
    }),
    file: one(file, {
        fields: [study_sessions.file_id],
        references: [file.id]
    })
}))


import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerk_user_id: text("clerk_user_id").notNull().unique(),
    email: text("email").default("").unique(),
    username: text("username").notNull(),
    created_at: timestamp("created_at",{withTimezone:true}).defaultNow().notNull()
})


export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
    title: text("title").notNull(),
    details: text("details"),
    due: text("due"),
    type: text("type", {enum: ['Assignments', 'Tasks', 'Events']}),
    created_at: timestamp("created_at", {withTimezone: true}).defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
    tasks: many(tasks)
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
    user: one(users, {
        fields: [tasks.user_id],
        references: [users.id]
    })
}))


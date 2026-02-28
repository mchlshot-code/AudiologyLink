import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface StrapiResource {
    id: number;
    attributes: {
        title: string;
        slug: string;
        content: string;
        publishedAt: string;
        category?: {
            data?: {
                attributes?: {
                    name: string;
                }
            } | null;
        };
    };
}

// Format Strapi response to match the existing UI expectations
function formatResource(strapiResource: StrapiResource) {
    const { id, attributes } = strapiResource;

    // Extract a brief description from the markdown content (first 100 characters)
    let description = attributes.content || "";
    // Very simple markdown strip just for the preview card
    description = description.replace(/[#*_\[\]()]/g, "").substring(0, 110).trim() + "...";

    const date = new Date(attributes.publishedAt || new Date()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return {
        id: id.toString(),
        title: attributes.title,
        description,
        category: attributes.category?.data?.attributes?.name || "Uncategorized",
        date,
        slug: attributes.slug
    };
}

export default async function ResourcesPage() {
    let resources: StrapiResource[] | null = null;
    let fetchError = false;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:1337";
        const res = await fetch(`${baseUrl}/api/resources?populate=category`, {
            next: { revalidate: 3600 } // ISR Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`Strapi returned ${res.status}`);
        }

        const json = await res.json();
        resources = json.data;
    } catch (err) {
        console.error("Error fetching resources from Strapi:", err);
        fetchError = true;
    }

    return (
        <div className="min-h-screen bg-background border-t border-border/40">

            {/* Header */}
            <div className="bg-primary/5 py-12 md:py-16 border-b border-border/50">
                <div className="container max-w-6xl px-4 md:px-6">
                    <div className="flex items-center gap-3 text-brand-cyan mb-4">
                        <BookOpen className="h-6 w-6" />
                        <h1 className="text-sm font-bold uppercase tracking-widest">Tier 1</h1>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-4xl">
                        Free Clinical Resources
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                        Open-access guides, cheat sheets, and articles curated to support public awareness and clinical foundations.
                        No account required.
                    </p>
                </div>
            </div>

            {/* Resource Grid */}
            <div className="container max-w-6xl px-4 md:px-6 py-12">
                {fetchError || !resources ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center flex flex-col items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Unable to load resources</h3>
                        <p className="text-sm text-destructive/80 max-w-sm">
                            We couldn&apos;t connect to the content system to fetch resources. Please try again later.
                        </p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <div className="mx-auto bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No resources available</h3>
                        <p>We are currently updating our clinical resource library.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.map((strapiResource) => {
                            const resource = formatResource(strapiResource);
                            return (
                                <Card key={resource.id} className="flex flex-col group hover:shadow-md transition-all duration-300 border-border/60 hover:border-brand-cyan/30">
                                    <div className="p-6 pb-0 mb-auto">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                                {resource.category}
                                            </span>
                                            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-brand-cyan transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors mt-2 mb-2">
                                            {resource.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Published {resource.date}
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {resource.description}
                                        </p>
                                    </div>
                                    <CardFooter className="pt-6 mt-auto border-t-0">
                                        <Button variant="ghost" className="w-full justify-between hover:bg-brand-cyan/10 hover:text-brand-cyan" asChild>
                                            <Link href={`/resources/${resource.slug}`}>
                                                Read Resource <ArrowRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

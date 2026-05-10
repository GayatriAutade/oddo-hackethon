import { useParams, Link } from "wouter";
import { useGetTrip, useGetTripBudget, getGetTripQueryKey, getGetTripBudgetQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, DollarSign, TrendingUp, MapPin, Database } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "framer-motion";

// Midnight Jet palette colors for charts
const COLORS = [
  "hsl(190, 90%, 50%)", // Primary Cyan
  "hsl(45, 100%, 50%)", // Secondary Gold
  "hsl(190, 90%, 30%)", // Dark Cyan
  "hsl(45, 100%, 30%)", // Dark Gold
  "hsl(0, 0%, 80%)",    // Light Gray
  "hsl(240, 10%, 40%)", // Muted
  "hsl(190, 50%, 70%)", // Soft Cyan
  "hsl(45, 60%, 70%)",  // Soft Gold
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Budget() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const { data: budget, isLoading } = useGetTripBudget(tripId, { query: { queryKey: getGetTripBudgetQueryKey(tripId), enabled: !!tripId } });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 bg-white/5 rounded-none" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 bg-white/5 rounded-none" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full bg-white/5 rounded-none" />
            <Skeleton className="h-[400px] w-full bg-white/5 rounded-none" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const hasData = budget && (budget.byCity.length > 0 || budget.byCategory.length > 0);

  return (
    <AppLayout>
      <motion.div 
        className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/trips/${tripId}`}>
                <Button variant="outline" size="sm" className="rounded-none border-white/20 hover:bg-white/10 font-mono uppercase tracking-widest text-[10px] h-8 gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              </Link>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1">
                {trip?.name || "LOADING..."}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground uppercase">
              Capital <span className="text-secondary">Allocation</span>
            </h1>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-white/10 bg-background/50 px-4 py-2">
            CURRENCY: USD [DEFAULT]
          </div>
        </motion.div>

        {/* Summary cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel border-secondary/30 rounded-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-full pointer-events-none" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-none border border-secondary bg-secondary/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total Burn Rate</p>
                <p className="font-serif text-3xl font-bold text-foreground">
                  <span className="text-secondary opacity-50 mr-1">$</span>
                  {budget?.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-primary/30 rounded-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full pointer-events-none" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-none border border-primary bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,232,0.2)]">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Daily Average</p>
                <p className="font-serif text-3xl font-bold text-foreground">
                  {budget?.perDay ? (
                    <>
                      <span className="text-primary opacity-50 mr-1">$</span>
                      {budget.perDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  ) : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/20 rounded-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-none border border-white/30 bg-white/5 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white/70" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Zones Tracked</p>
                <p className="font-serif text-3xl font-bold text-foreground">{budget?.byCity?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By City Bar Chart */}
            {budget.byCity.length > 0 && (
              <motion.div variants={item}>
                <Card className="glass-panel border-white/10 rounded-none h-full flex flex-col">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                      <Database className="h-4 w-4" /> Capital by Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budget.byCity} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis 
                          dataKey="cityName" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} 
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }}
                          tickFormatter={(v) => `$${v}`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--primary) / 0.3)',
                            borderRadius: '0',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            boxShadow: '0 0 15px rgba(0,212,232,0.1)'
                          }}
                          itemStyle={{ color: 'hsl(var(--primary))' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Capital"]}
                          labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '8px', fontWeight: 'bold' }}
                        />
                        <Bar 
                          dataKey="amount" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 0, 0, 0]} 
                          activeBar={{ fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--secondary))', strokeWidth: 1 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* By Category Pie Chart */}
            {budget.byCategory.length > 0 && (
              <motion.div variants={item}>
                <Card className="glass-panel border-white/10 rounded-none h-full flex flex-col">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="font-mono text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                      <Database className="h-4 w-4" /> Capital by Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 min-h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={budget.byCategory}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {budget.byCategory.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--secondary) / 0.3)',
                            borderRadius: '0',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            boxShadow: '0 0 15px rgba(255,215,0,0.1)'
                          }}
                          itemStyle={{ color: 'hsl(var(--secondary))' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Capital"]}
                        />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: 'hsl(var(--foreground))' }}
                          formatter={(value) => <span className="text-muted-foreground uppercase">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Detailed Ledger Table */}
            {budget.byCity.length > 0 && (
              <motion.div variants={item} className="lg:col-span-2">
                <Card className="glass-panel border-white/10 rounded-none">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="font-mono text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                      <Database className="h-4 w-4" /> Ledger Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <tr>
                            <th className="px-6 py-4 font-normal">Zone</th>
                            <th className="px-6 py-4 font-normal">Distribution</th>
                            <th className="px-6 py-4 font-normal text-right">Capital (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {budget.byCity.map((city, i) => (
                            <tr key={city.cityName} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5">
                                    {(i + 1).toString().padStart(2, '0')}
                                  </div>
                                  <span className="font-bold uppercase tracking-widest text-sm">{city.cityName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 w-1/2">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1 bg-white/5 h-2 rounded-none relative overflow-hidden">
                                    <div
                                      className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_rgba(0,212,232,0.5)]"
                                      style={{ width: `${budget.total > 0 ? (city.amount / budget.total) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground w-12 text-right">
                                    {budget.total > 0 ? Math.round((city.amount / budget.total) * 100) : 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-bold text-foreground">
                                  ${city.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-white/5 border-t border-white/10">
                          <tr>
                            <td className="px-6 py-4 font-bold text-sm uppercase tracking-widest" colSpan={2}>Total Allocation</td>
                            <td className="px-6 py-4 text-right font-bold text-secondary text-lg">
                              ${budget.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 glass-panel border border-white/10 rounded-none relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <DollarSign className="h-16 w-16 text-primary/40 mx-auto mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest text-foreground mb-2">No Ledger Data</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">No capital requirements defined in mission parameters.</p>
            <Link href={`/trips/${tripId}/itinerary`}>
              <Button className="rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] h-12 px-8">
                Define Objectives
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}

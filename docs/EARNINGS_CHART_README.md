# Gráfico de Estatísticas de Ganhos

Esta funcionalidade implementa um gráfico de linha moderno para visualizar a evolução dos ganhos de vouchers ao longo do tempo.

## Funcionalidades Implementadas

### 📊 Componente EarningsChart
- **Localização**: `src/components/EarningsChart.tsx`
- **Descrição**: Componente que renderiza um gráfico de linha mostrando a evolução dos ganhos
- **Características**:
  - Gráfico de linha suave (bezier) usando `react-native-chart-kit`
  - Loading state com indicador visual
  - Tratamento de erros com botão de retry
  - Formatação automática de valores (k para milhares)
  - Limitação inteligente de pontos no gráfico (máximo 6 labels)
  - Responsivo para diferentes tamanhos de tela

### 🗓️ Componente PeriodSelector
- **Localização**: `src/components/PeriodSelector.tsx`
- **Descrição**: Seletor de período flexível para o gráfico
- **Características**:
  - Botões de período pré-definido (Este Mês, Mês Anterior, 90 Dias, Este Ano)
  - Seleção customizada de data de início e fim
  - DateTimePicker nativo do React Native
  - Validação de períodos (data final não pode ser anterior à inicial)

### 🔌 Hook useEarningsStatistics
- **Localização**: `src/hooks/useEarningsStatistics.ts`
- **Descrição**: Hook personalizado para gerenciar dados de estatísticas
- **Características**:
  - Busca automática quando datas mudam
  - Estados de loading, error e data
  - Função refetch para recarregar dados
  - Tratamento de erros robusto

### 🌐 Serviço de API
- **Localização**: `src/services/api.ts`
- **Endpoint**: `GET /v2/voucher/statistics/earnings`
- **Funcionalidade**: Integração com API backend para buscar dados de ganhos

## Integração na Tela de Estatísticas

A nova funcionalidade foi integrada na `StatisticsScreen.tsx` com:

1. **Seletor de Período**: Permite escolher o período para análise de ganhos
2. **Gráfico de Ganhos**: Exibe a evolução temporal dos ganhos
3. **Separação de Contextos**: 
   - Período do gráfico é independente do período de análise por categoria
   - Mantém a funcionalidade existente intacta

## Como Usar

### Pré-requisitos
- API backend implementada no endpoint `/v2/voucher/statistics/earnings`
- Token JWT válido para autenticação

### Exemplo de Uso do Hook

```typescript
import useEarningsStatistics from '../hooks/useEarningsStatistics';

const MyComponent = () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    const { data, loading, error, refetch } = useEarningsStatistics(startDate, endDate);
    
    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent onRetry={refetch} />;
    
    return <ChartComponent data={data} />;
};
```

### Exemplo de Integração

```typescript
import EarningsChart from '../components/EarningsChart';
import PeriodSelector from '../components/PeriodSelector';

const StatisticsScreen = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    
    const handlePeriodChange = (start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
    };
    
    return (
        <View>
            <PeriodSelector
                startDate={startDate}
                endDate={endDate}
                onPeriodChange={handlePeriodChange}
            />
            <EarningsChart
                startDate={startDate}
                endDate={endDate}
            />
        </View>
    );
};
```

## Design UX/UI

### 🎨 Características Visuais
- **Cores**: Segue o tema do aplicativo usando `COLORS.green` como cor principal
- **Tipografia**: Utiliza `FONTS` definidos no tema
- **Espaçamento**: Consistente com `SIZES` do design system
- **Sombras**: Cards com elevação sutil para profundidade
- **Responsividade**: Adaptável a diferentes tamanhos de tela

### 🔄 Estados da Interface
1. **Loading**: Indicador de carregamento com texto explicativo
2. **Sucesso**: Gráfico renderizado com dados e resumo
3. **Erro**: Mensagem de erro com botão de retry
4. **Sem Dados**: Mensagem informativa quando não há dados

### 📱 Usabilidade
- **Interatividade**: Botões de período pré-definido para uso rápido
- **Feedback Visual**: Estados claros de loading e erro
- **Acessibilidade**: Textos descritivos e contrastes adequados

## Estrutura de Dados

### Request Parameters
```typescript
interface EarningsParams {
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
}
```

### Response Format
```typescript
interface EarningsStatisticsResponse {
    data: Array<{
        date: string;     // YYYY-MM-DD
        value: number;    // Soma dos valores dos vouchers
        count: number;    // Quantidade de vouchers
    }>;
    summary: {
        totalEarnings: number;    // Total de ganhos no período
        voucherCount: number;     // Total de vouchers no período
        period: {
            from: string;         // Data de início
            to: string;           // Data de fim
        };
        intervalDays: number;     // Dias por ponto no gráfico
    };
}
```

## Dependências Adicionadas

- `react-native-chart-kit`: Para renderização de gráficos
- `react-native-svg`: Dependência do chart-kit para SVG

## Instalação das Dependências

```bash
yarn add react-native-chart-kit react-native-svg
```

## Próximos Passos

1. **Testes**: Implementar testes unitários para os componentes
2. **Otimização**: Cache de dados para melhor performance
3. **Internacionalização**: Suporte a múltiplos idiomas
4. **Acessibilidade**: Melhorar suporte para leitores de tela
5. **Animações**: Adicionar transições suaves entre períodos

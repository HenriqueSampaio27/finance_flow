import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

type Preset =
  | "hoje"
  | "ontem"
  | "semana"
  | "mes"
  | "mesPassado"
  | "7dias"
  | "30dias"
  | "personalizado";

function formatDateBR(date: string) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  // Segunda-feira = início da semana
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);

  return result;
}

function getPresetDates(preset: Preset) {
  const today = new Date();

  let start: Date;
  let end: Date;

  switch (preset) {
    case "hoje":
      start = new Date(today);
      end = new Date(today);
      break;

    case "ontem": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      start = yesterday;
      end = yesterday;
      break;
    }

    case "semana":
      start = startOfWeek(today);
      end = endOfWeek(today);
      break;

    case "mes":
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      break;

    case "mesPassado":
      start = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );

      break;

    case "7dias": {
      start = new Date(today);
      start.setDate(start.getDate() - 6);

      end = new Date(today);
      break;
    }

    case "30dias": {
      start = new Date(today);
      start.setDate(start.getDate() - 29);

      end = new Date(today);
      break;
    }

    default:
      return {
        startDate: "",
        endDate: "",
      };
  }

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onChange,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedPreset, setSelectedPreset] =
    useState<Preset>("mes");

  const [tempStartDate, setTempStartDate] =
    useState(startDate);

  const [tempEndDate, setTempEndDate] =
    useState(endDate);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
   * Fecha o modal quando clicar fora
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * Quando abrir, copia o período atual
   */
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isOpen, startDate, endDate]);

  /*
   * Selecionar um período pronto
   */
  function handlePreset(preset: Preset) {
    setSelectedPreset(preset);

    if (preset === "personalizado") {
      return;
    }

    const dates = getPresetDates(preset);

    setTempStartDate(dates.startDate);
    setTempEndDate(dates.endDate);
  }

  /*
   * Aplicar período
   */
  function handleApply() {
    if (!tempStartDate || !tempEndDate) {
      return;
    }

    if (tempStartDate > tempEndDate) {
      alert(
        "A data inicial não pode ser maior que a data final."
      );

      return;
    }

    onChange(
      tempStartDate,
      tempEndDate
    );

    setIsOpen(false);
  }

  /*
   * Limpar filtro
   */
  function handleClear() {
    setTempStartDate("");
    setTempEndDate("");

    onChange("", "");

    setIsOpen(false);
  }

  /*
   * Texto mostrado no botão
   */
  function getButtonLabel() {
    if (!startDate || !endDate) {
      return "Todos os períodos";
    }

    return `${formatDateBR(startDate)} — ${formatDateBR(
      endDate
    )}`;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* BOTÃO DO PERÍODO */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2  rounded-lg px-0 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-slate-500" />

        <span>
          {getButtonLabel()}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* MODAL / DROPDOWN */}

      {isOpen && (
        <div className="absolute right--100 top-full mt-2 z-50 w-[360px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {/* CABEÇALHO */}

          <div className="flex items-center justify-between px-2 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Selecionar período
              </h3>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Escolha o período que deseja visualizar
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ATALHOS */}

          <div className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Período rápido
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["hoje", "Hoje"],
                ["ontem", "Ontem"],
                ["semana", "Esta semana"],
                ["mes", "Este mês"],
                ["mesPassado", "Mês passado"],
                ["7dias", "Últimos 7 dias"],
                ["30dias", "Últimos 30 dias"],
                ["personalizado", "Personalizado"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    handlePreset(value as Preset)
                  }
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedPreset === value
                      ? "bg-[#003d9b] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* DATAS */}

          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {/* DATA INICIAL */}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Data inicial
                </label>

                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => {
                    setTempStartDate(e.target.value);
                    setSelectedPreset("personalizado");
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b]"
                />
              </div>

              {/* DATA FINAL */}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Data final
                </label>

                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => {
                    setTempEndDate(e.target.value);
                    setSelectedPreset("personalizado");
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b]"
                />
              </div>
            </div>
          </div>

          {/* RODAPÉ */}

          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Limpar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003d9b] hover:bg-[#003580] rounded-lg transition-colors cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

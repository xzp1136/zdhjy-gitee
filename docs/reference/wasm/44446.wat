  (func (;44446;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4367456
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3353480
      call 2180
      i32.const 3387092
      call 2180
      i32.const 3387084
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3351228
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3432328
      call 2180
      i32.const 4367456
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=4
    i32.const 3351228
    i32.load
    call 1900
    local.tee 6
    i32.const 3387084
    i32.load
    call 35169
    i32.const 3353480
    i32.load
    i32.const 4
    call 2185
    local.tee 7
    i32.const 3432328
    i32.load
    i32.const 0
    call 52128
    block  ;; label = @1
      local.get 7
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        i32.const 3375560
        i32.load
        local.set 5
        local.get 0
        i32.load offset=48
        local.set 3
        local.get 4
        local.get 7
        local.get 8
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        i32.store offset=8
        local.get 3
        local.get 4
        i32.const 8
        i32.add
        local.get 4
        i32.const 4
        i32.add
        local.get 5
        call 34286
        if  ;; label = @3
          i32.const 0
          local.set 5
          block  ;; label = @4
            local.get 4
            i32.load offset=4
            local.tee 3
            i32.load offset=12
            i32.const 0
            i32.le_s
            br_if 0 (;@4;)
            loop  ;; label = @5
              local.get 6
              i32.load offset=12
              local.get 2
              i32.ge_s
              br_if 1 (;@4;)
              local.get 3
              local.get 5
              local.get 4
              i32.const 12
              i32.add
              i32.const 3387116
              i32.load
              call 50458
              local.get 4
              i32.load offset=12
              local.set 3
              i32.const 3360788
              i32.load
              local.tee 9
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 9
                call 60460
              end
              block  ;; label = @6
                local.get 3
                i32.const 0
                i32.const 0
                call 48872
                br_if 0 (;@6;)
                local.get 3
                i32.load offset=56
                local.get 1
                i32.ne
                br_if 0 (;@6;)
                local.get 3
                i32.load8_u offset=97
                br_if 0 (;@6;)
                local.get 3
                i32.load8_u offset=96
                br_if 0 (;@6;)
                local.get 6
                local.get 3
                i32.const 3387092
                i32.load
                call 50463
              end
              local.get 5
              i32.const 1
              i32.add
              local.tee 5
              local.get 4
              i32.load offset=4
              local.tee 3
              i32.load offset=12
              i32.lt_s
              br_if 0 (;@5;)
            end
          end
          local.get 6
          i32.load offset=12
          local.get 2
          i32.ge_s
          br_if 2 (;@1;)
        end
        local.get 8
        i32.const 1
        i32.add
        local.tee 8
        local.get 7
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0
    local.get 6)

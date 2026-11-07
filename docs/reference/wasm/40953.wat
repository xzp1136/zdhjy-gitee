  (func (;40953;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4365076
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3365220
      call 2180
      i32.const 4365076
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      block (result i32)  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.load offset=8
              br_table 0 (;@5;) 1 (;@4;) 4 (;@1;)
            end
            local.get 0
            i32.const -1
            i32.store offset=8
            i32.const 3365220
            i32.load
            call 1900
            local.tee 1
            f32.const 0x1.333334p-3 (;=0.15;)
            i32.const 0
            call 2408
            local.get 0
            i32.const 0
            i32.store offset=36
            local.get 0
            local.get 1
            i32.store offset=32
            br 1 (;@3;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          i32.const 0
          br 1 (;@2;)
        end
        i32.const 1
      end
      local.set 1
      loop (result i32)  ;; label = @2
        local.get 1
        i32.eqz
        if  ;; label = @3
          local.get 0
          local.get 0
          i32.load offset=36
          i32.const 1
          i32.add
          local.tee 3
          i32.store offset=36
          i32.const 1
          local.set 1
          br 1 (;@2;)
        end
        local.get 3
        local.get 0
        i32.load offset=16
        local.tee 1
        i32.load offset=12
        i32.ge_s
        br_if 1 (;@1;)
        local.get 1
        local.get 3
        local.get 2
        i32.const 12
        i32.add
        i32.const 3387116
        i32.load
        call 50458
        local.get 2
        i32.load offset=12
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48872
        if (result i32)  ;; label = @3
          i32.const 0
          local.set 1
          br 1 (;@2;)
        else
          local.get 1
          local.get 0
          i32.load offset=20
          local.get 0
          i32.load8_u offset=24
          local.get 0
          i32.load offset=28
          i32.const 0
          call 44379
          drop
          local.get 0
          i32.const 1
          i32.store offset=8
          local.get 0
          local.get 0
          i32.load offset=32
          i32.store offset=12
          i32.const 1
        end
      end
      local.set 5
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 5)

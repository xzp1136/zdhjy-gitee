  (func (;44438;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 0
    local.set 4
    i32.const 4367448
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3387108
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367448
      i32.const 1
      i32.store8
    end
    local.get 5
    i32.const 0
    i32.store offset=4
    local.get 3
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 3375560
      i32.load
      local.set 4
      local.get 0
      i32.load offset=48
      local.set 6
      local.get 5
      local.get 1
      i32.store offset=8
      block  ;; label = @2
        local.get 6
        local.get 5
        i32.const 8
        i32.add
        local.get 5
        i32.const 4
        i32.add
        local.get 4
        call 34286
        i32.eqz
        br_if 0 (;@2;)
        local.get 5
        i32.load offset=4
        local.tee 6
        i32.load offset=12
        i32.const 1
        i32.sub
        local.tee 4
        i32.const 0
        i32.lt_s
        br_if 0 (;@2;)
        loop  ;; label = @3
          local.get 6
          local.get 4
          local.get 5
          i32.const 12
          i32.add
          i32.const 3387116
          i32.load
          call 50458
          local.get 5
          i32.load offset=12
          local.set 6
          i32.const 3360788
          i32.load
          local.tee 7
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 7
            call 60460
          end
          block  ;; label = @4
            local.get 6
            i32.const 0
            i32.const 0
            call 48872
            if  ;; label = @5
              local.get 5
              i32.load offset=4
              local.get 4
              i32.const 3387108
              i32.load
              call 50451
              br 1 (;@4;)
            end
            local.get 6
            i32.load offset=56
            local.get 2
            i32.ne
            br_if 0 (;@4;)
            local.get 6
            i32.load8_u offset=96
            br_if 0 (;@4;)
            local.get 6
            i32.load8_u offset=108
            br_if 0 (;@4;)
            local.get 0
            local.get 6
            local.get 1
            local.get 5
            call 44439
            local.get 3
            i32.const 1
            i32.sub
            local.set 3
          end
          local.get 4
          i32.const 1
          i32.sub
          local.tee 4
          i32.const 0
          i32.lt_s
          br_if 1 (;@2;)
          local.get 3
          i32.const 0
          i32.le_s
          br_if 1 (;@2;)
          local.get 5
          i32.load offset=4
          local.set 6
          br 0 (;@3;)
        end
        unreachable
      end
      local.get 3
      local.set 4
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 4)
